import React from "react";
import { Text, TextProps } from "ink";

export const GreenText = ({
	children,
	...otherProps
}: TextProps): JSX.Element => {
	return (
		<Text color="green" {...otherProps}>
			{children}
		</Text>
	);
};
