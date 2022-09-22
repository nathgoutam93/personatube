import React, { useEffect, useState } from 'react';

type Props = {};

const States = (props: Props) => {
  const [idle, setIdle] = useState();
  const [open, setopen] = useState();

  useEffect(() => {});

  return (
    <div className="flex flex-col">
      <div className="mt-4 relative h-32 w-32 rounded-full cursor-pointer">
        <img src="" className="h-32 w-32 rounded-3xl object-cover" alt="" />
        <input
          className="hidden"
          aria-label="profile pic"
          type="file"
          accept="image/png, image/jpeg"
        />
      </div>
    </div>
  );
};

export default States;
