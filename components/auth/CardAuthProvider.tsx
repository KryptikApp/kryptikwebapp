interface Props {
  children: React.ReactNode;
  clickHandler: () => any;
}
export default function AuthProviderCard(props: Props) {
  const { children, clickHandler } = { ...props };
  return (
    <div
      className="rounded-md px-4 py-3 dark:bg-sky-500/10 bg-sky-300/10 hover:dark:brightness-75 hover:brightness-125 hover:cursor-pointer"
      onClick={() => clickHandler()}
    >
      {children}
    </div>
  );
}
