const AppIcons = ({ Logo, name }) => {
  return (
    <div className="flex flex-col justify-center text-center text-base md:text-xl w-28 md:w-32">
      <div className="aspect-w-1 aspect-h-1">
        <img src={Logo} alt={name} />
      </div>
      <h1>{name}</h1>
    </div>
  );
};

export default AppIcons;
