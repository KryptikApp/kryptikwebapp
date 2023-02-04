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
  onScan: (uri: string) => void;
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
      height: 300,
      width: 1000,
    }

  return (
    <div>
      {show ? (
      <div className="w-[400px] max-h-[300px] rounded overflow-hidden">
        <ReactQrReader
          videoStyle={previewStyle}
          constraints={{facingMode: "user"}}
          className={"scale-150"}
          onResult={(data) => handleScan(data)}
        />
      </div> 
      ) : (<div></div>)
      }
    </div>
  );
}
