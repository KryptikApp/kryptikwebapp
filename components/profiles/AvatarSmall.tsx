import { NextPage } from "next";

interface Props {
  photoPath: string;
}
export default function AvatarSmall(props: Props) {
  const { photoPath } = props;
  return (
    <div className="">
      {photoPath == "" ? (
        <div className="shadow rounded-lg bg-sky-600 max-w-full h-auto align-middle border-none transition ease-in-out delay-100 transform hover:-translate-y-1" />
      ) : (
        <img
          src={photoPath}
          alt="Profile Image"
          className="object-cover w-12 h-12 rounded-lg transition ease-in-out delay-100 transform hover:-translate-y-1"
        />
      )}
    </div>
  );
}
