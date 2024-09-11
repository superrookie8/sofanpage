'use client'
import React from 'react';
import { useRouter } from 'next/navigation';

interface Props {}

const DiaryRead: React.FC<Props> = (props) => {
    const router = useRouter();

    // 로그인 페이지로 이동하는 함수
    const goToLogin = () => {
        router.push('/login');
    };

    return (
        <>
        <div className='w-full h-[150px] flex flex-col gap-4 justify-center items-center bg-black bg-opacity-75'>
            <span className='text-white mr-4'> 작성하려면, 로그인이 필요합니다! </span>
            <button
                onClick={goToLogin}
                className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none'
            >
                로그인 바로가기
            </button>
        </div>
        <div>
            <span>여기에 최신 직관 소식</span>
            <div className='flex flex-row justify-center items-center gap-4'>
                <div className ="flex flex-col justify-center items-center w-[200px] h-[300px] bg-gray-300">
                    <div className='w-full h-3/5 bg-red-200'>사진영역</div>
                    <div className='flex flex-col w-full h-2/5'>
                        <span>아이디</span>
                        <span>농구마니아지수:</span>
                        <span>날씨요정지수: </span>
                        <span>직관승요지수:</span> 
                        <span>홈경기승요지수:</span>    </div>
                     </div>
            </div>
        </div>
        </>
    );
};

export default DiaryRead;
