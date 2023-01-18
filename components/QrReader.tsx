import Image from "next/image";
import { Fragment, useState } from "react";
import { QrReader as ReactQrReader } from "react-qr-reader";
import { ColorEnum } from "../src/helpers/utils";
import Button from "./buttons/Button";

/**
 * Types
 */
interface IProps {
  onConnect: (uri: string) => Promise<void>;
}

/**
 * Component
 */
export default function QrReader({ onConnect }: IProps) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  function onError() {
    setShow(false);
  }

  async function onScan(data: string | null) {
    if (data) {
      await onConnect(data);
      setShow(false);
    }
  }

  function onShowScanner() {
    setLoading(true);
    setShow(true);
  }

  return (
    <div className="mx-auto">
      {show ? (
        <div className="mx-auto w-[100%] max-h-[280px] relative rounded rounded-lg overflow-hidden">
          <ReactQrReader
            constraints={{ facingMode: "user" }}
            className="scale-150"
          />
        </div>
      ) : (
        <div className="flex flex-col space-y-2 py-14 mx-auto border border-gray-400 dark:border-gray-500 w-[340px] h-[280px] rounded rounded-lg">
          <Image
            src="/icons/qrIcon.svg"
            width={100}
            height={100}
            alt="qr code icon"
            className="qrIcon"
          />
          <div className="mx-auto">
            <Button
              color={ColorEnum.blue}
              text={"Scan QR Code"}
              clickHandler={onShowScanner}
            />
          </div>
        </div>
      )}
    </div>
  );
}
