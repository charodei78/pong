import { AvatarProps } from "./Avatar.props";
import styles from "./Avatar.module.css";
import cn from "classnames";
import { useEffect } from "react";

export const Avatar = ({
  size = "small",
  name = "",
  image,
  className,
  onClick,
  ...props
}: AvatarProps): JSX.Element => {
  useEffect(() => {
    console.log("Avatar onClick: " + onClick);
  }, []);

  if (Object.keys(image).length === 0) {
    image = ["/no-avatar.png", "/no-avatar.png"];
  } else {
    image = [
      process.env.IMAGES_LINK + image[0],
      process.env.IMAGES_LINK + image[1],
    ];
  }
  // set small or large image
  const src = size === "small" ? image[0] : image[1];
  return (
    <img
      src={src}
      className={cn(styles.avatar, className, {
        [styles.small]: size == "small",
        [styles.large]: size == "large",
        [styles.pointer]: onClick,
      })}
      alt={name}
      onClick={onClick ? onClick : null}
      {...props}
    />
  );
};
