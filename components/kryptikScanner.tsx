import Image from "next/image";
import { Fragment, useState } from "react";
import { QrReader as ReactQrReader } from "react-qr-reader";
import { ColorEnum } from "../src/helpers/utils";
import Button from "./buttons/Button";

/**
 * Types
 */
interface IProps {
  show: boolean;
  onScan: (uri: string) => Promise<void>;
}

/**
 * Component
 */
export default function KryptikScanner(iprops: IProps) {
  const {show, onScan} = {...iprops}
  const handleScan = async function (data: any) {
    if (data && data.text && typeof data.text == "string") {
      await onScan(data.text);
    }
  };
  
  const previewStyle = {
      height: 240,
      width: 320,
    }

  return (
    <div className="mx-auto">
      {show ? (
      <div className="mx-auto w-[400px] max-h-[300px] relative rounded rounded-lg overflow-hidden">
        <ReactQrReader
          delay={5000}
          style={previewStyle}
          //constraints={{facingMode: "user"}}
          className="scale-150"
          onResult={(data) => handleScan(data)}
        />
      </div> 
      ) : (<div></div>)
      }
    </div>
  );
}
