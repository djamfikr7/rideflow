import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-black",
  secondary: "bg-gray-100 border border-gray-300",
  danger: "bg-red-500",
  ghost: "bg-transparent",
};

const textStyles: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-black",
  danger: "text-white",
  ghost: "text-black",
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={`py-4 rounded-full items-center justify-center ${variantStyles[variant]} ${
        disabled ? "opacity-50" : ""
      } ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? "#000" : "#fff"} />
      ) : (
        <Text className={`text-lg font-semibold ${textStyles[variant]}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
