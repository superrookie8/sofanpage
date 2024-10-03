import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";

interface Photo {
  _id: string;
  filename: string;
  base64: string;
  url: string;
}

const GetPhotos: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);


  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/getphotos', {
        method: "GET",
      });
      const data = await response.json();
      console.log("Full API response:", data);

      if (response.ok) {
        setPhotos(data.admin_photos);
      } else {
        console.error("Failed to fetch photos", data);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);


  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };


  return (
    <div className="w-full p-4 relative flex flex-col">
      {photos.length > 0 && (
          <div className="w-full photo-row flex flex-row gap-4">
            {photos.concat(photos).map((photo, index) => (
              <div key={index} className="photo-item flex-shrink-0" data-index={index}>
                <Image
                  src={photo.base64}
                  alt={`Photo ${index + 1}`}
                  width={400}
                  height={400}
				  style={{objectFit: "cover", width : "400px", height : "400px" , borderRadius: "10px" , boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.5)"}}
                  onClick={() => handlePhotoClick(photo)}
                />
              </div>
            ))}
        </div>
      )}

      {selectedPhoto && (
        <div
          className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="w-full relative bg-white bg-opacity-75 p-4 rounded max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-3xl max-h-[90vh] overflow-auto mx-4 my-8 sm:my-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[420px]">
              <Image
                src={selectedPhoto.base64}
                alt="Selected"
                fill
                style={{ objectFit: "contain"}}
                className="object-contain"
              />
            </div>
            <button
              className="absolute size-8 top-4 right-2 text-black bg-white rounded flex justify-center items-center mt-1 pt-2"
			  style={{fontSize: "4rem"}}
              onClick={closeModal}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetPhotos;

