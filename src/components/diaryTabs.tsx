'use client'
import React, { useState } from 'react';

interface Props {}

const DiaryTabs: React.FC<Props> = () => {
    const [activeTab, setActiveTab] = useState<'A' | 'B'>('A'); // 기본 A탭

    return (
        <div className="w-full">
            {/* 탭 버튼들 */}
            <div className="flex justify-center space-x-4">
                <button
                    onClick={() => setActiveTab('A')}
                    className={`px-4 py-2 ${activeTab === 'A' ? 'border-b-2 border-blue-500' : ''}`}
                >
                    내가 기록한 직관일지
                </button>
                <button
                    onClick={() => setActiveTab('B')}
                    className={`px-4 py-2 ${activeTab === 'B' ? 'border-b-2 border-blue-500' : ''}`}
                >
                    전체 직관일지 리스트
                </button>
            </div>

            {/* 탭에 따른 내용 */}
            <div className="mt-4">
                {activeTab === 'A' && (
                    <div>
                    <div className = "flex flex-row items-center gap-16"> 
				<span>농구마니아지수 : 80%</span>
				<span>날씨요정지수 : 50%</span>
				<span>직관승요지수 : 30%</span> 
				<span>홈경기 승요지수 : 20% </span>
				</div>
			<div className="w-full h-[100px] border-2 border-red-500 rounded">
				<div className = "flex flex-row justify-start items-center gap-16 pl-4">
					<span>관람일자 : 2024년 9월 7일 토요일 </span>
					<span>날씨 : 맑음 </span>
					<span>함께 본 사람 : 나와 함께 </span>
					
				</div>
				<div className="bg-yellow-200 flex flex-row items-center">
					<div className="w-[50px] h-[70px] bg-gray-300 flex items-center justify-center">사진</div><div className="w-auto pl-4">글</div></div>

				</div>
				<div className="w-full h-[100px] border-2 border-red-500 rounded">
				<div className = "flex flex-row justify-start items-center gap-16 pl-4">
					<span>관람일자 : 2024년 9월 7일 토요일 </span>
					<span>날씨 : 맑음 </span>
					<span>함께 본 사람 : 나와 함께 </span>
				
				</div>
				<div className="bg-yellow-200 flex flex-row items-center">
					<div className="w-[50px] h-[70px] bg-gray-300 flex items-center justify-center">사진</div><div className="w-auto pl-4">글</div></div>

				</div>
				<div className="w-full h-[100px] border-2 border-red-500 rounded">
				<div className = "flex flex-row justify-start items-center gap-16 pl-4">
					<span>관람일자 : 2024년 9월 7일 토요일 </span>
					<span>날씨 : 맑음 </span>
					<span>함께 본 사람 : 나와 함께 </span>
					
				</div>
				<div className="bg-yellow-200 flex flex-row items-center">
					<div className="w-[50px] h-[70px] bg-gray-300 flex items-center justify-center">사진</div><div className="w-auto pl-4">글</div></div>

				</div>
				
                    </div>
                )}
                {activeTab === 'B' && (
                    <div>
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
                     <div className ="flex flex-col justify-center items-center w-[200px] h-[300px] bg-gray-300">
                    <div className='w-full h-3/5 bg-red-200'>사진영역</div>
                    <div className='flex flex-col w-full h-2/5'>
                        <span>아이디</span>
                        <span>농구마니아지수:</span>
                        <span>날씨요정지수: </span>
                        <span>직관승요지수:</span> 
                        <span>홈경기승요지수:</span>    </div>
                     </div>
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
                )}
            </div>
        </div>
    );
};

export default DiaryTabs;
