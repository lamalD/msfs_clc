import React from 'react'

const Messages = () => {
  return (
    <div className='flex flex-row w-full justify-start items-center pl-0.5'>
      <div className='flex flex-col w-1/3 justify-center items-center bg-gray-1'>
        Scrollbar
      </div>
      <div className='flex flex-col w-2/3 justify-center items-center bg-white-1'>
        MessageViewer
      </div>
    </div>
  )
}

export default Messages