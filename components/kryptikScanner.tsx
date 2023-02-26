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

  return (
    <div>
      {show ? (
        <div className="w-full max-w-[80vh]">
          <ReactQrReader
            constraints={{ facingMode: "environment" }}
            className={""}
            onResult={(data: any) => handleScan(data)}
          />
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
