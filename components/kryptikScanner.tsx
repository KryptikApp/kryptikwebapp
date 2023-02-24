import { QrReader as ReactQrReader } from "react-qr-reader";
import { ViewFinder } from "./viewfinder";

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
  const handleScan = async function (data: any) {
    if (data && data.text && typeof data.text == "string") {
      await onScan(data.text);
    }
  };

  const previewStyle = {
    height: 400,
    width: 1000,
  };
  const containerStyle = {};

  return (
    <div>
      {show ? (
        <div className="w-[400px] max-w-[90vw]  max-h-[80vh] rounded overflow-hidden">
          <ReactQrReader
            videoStyle={previewStyle}
            containerStyle={containerStyle}
            constraints={{ facingMode: "environment" }}
            className={"scale-150"}
            onResult={(data: any) => handleScan(data)}
          />
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
