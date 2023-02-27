import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

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
  const { show, onScan } = { ...iprops };
  const [qrScanner, setQrScanner] = useState<QrScanner | null>();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handleScan = async function (data: any) {
    if (data && data.text && typeof data.text == "string") {
      onScan(data.text);
    }
  };

  useEffect(() => {
    console.log("HERE!");
    if (!videoRef.current) {
      console.log("No video ref available.");
      return;
    }
    const newQrScanner = new QrScanner(
      videoRef.current,
      (result) => {
        console.log("RESULT");
        console.log(result);
      },
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        onDecodeError: () => {
          //pass
        },
      }
    );
    newQrScanner.setInversionMode("both");
    setQrScanner(newQrScanner);
  }, []);

  useEffect(() => {
    if (!qrScanner) return;
    if (show) {
      qrScanner.start();
    } else {
      qrScanner.stop();
    }
  }, [show]);

  return (
    <div className="">
      <video
        ref={videoRef}
        className="rounded-xl object-cover w-full max-w-sm h-96 mb-8"
        muted
        id="scanner"
      />
    </div>
  );
}
