import { NextPage } from "next";

interface Props {
  photoPath: string;
}
const AvatarMain: NextPage<Props> = (props) => {
  const { photoPath } = props;
  return (
    <div className="">
      {photoPath == "" ? (
        <div className="shadow rounded-full bg-sky-600 max-w-full h-auto align-middle border-none transition ease-in-out delay-100 transform hover:-translate-y-1" />
      ) : (
        <img
          src={photoPath}
          alt="Profile Image"
          className="object-cover w-28 h-28 md:w-24 md:h-24 rounded-full mx-auto mb-2 transition ease-in-out delay-100 transform hover:-translate-y-1"
        />
      )}
    </div>
  );
};

export default AvatarMain;
