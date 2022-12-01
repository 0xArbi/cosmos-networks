import { useState } from "react";
import Image from "next/image";

const SIZE = 30;

export function NetworkIcon({ name }: { name: string }) {
  const fallback = `/networks/${name}.png`;
  const [image, setImage] = useState(
    `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/coin_image/chains/chain-${name}.svg`
  );
  const [hasErrored, setHasErrored] = useState(false);

  if (hasErrored) {
    return (
      <div
        style={{ height: SIZE, width: SIZE, fontSize: 10 }}
        className="bg-gray-500 rounded-full text-white items-center justify-center flex border border-gray-200"
      >
        {name.slice(0, 3).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      alt={name}
      className="rounded-md"
      src={image}
      height={SIZE}
      width={SIZE}
      onError={() => {
        if (image === fallback) {
          setHasErrored(true);
        }

        setImage(fallback);
      }}
    />
  );
}
