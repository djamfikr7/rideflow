import React from "react";

export function View({
  children,
  className,
  style,
  testID,
  ...props
}: any) {
  return (
    <div data-testid={testID} className={className} style={style} {...props}>
      {children}
    </div>
  );
}

export function Text({
  children,
  className,
  style,
  testID,
  ...props
}: any) {
  return (
    <span data-testid={testID} className={className} style={style} {...props}>
      {children}
    </span>
  );
}

export function TouchableOpacity({
  children,
  className,
  onPress,
  disabled,
  activeOpacity,
  testID,
  ...props
}: any) {
  return (
    <button
      data-testid={testID}
      className={className}
      onClick={disabled ? undefined : onPress}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function Pressable({
  children,
  className,
  onPress,
  disabled,
  testID,
  ...props
}: any) {
  return (
    <button
      data-testid={testID}
      className={className}
      onClick={disabled ? undefined : onPress}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function ActivityIndicator({
  color,
  size,
  testID,
  ...props
}: any) {
  return (
    <div data-testid={testID || "activity-indicator"} role="progressbar" {...props}>
      Loading...
    </div>
  );
}

export function FlatList({
  data,
  renderItem,
  keyExtractor,
  ...props
}: any) {
  return (
    <div {...props}>
      {data?.map((item: any, index: number) => (
        <div key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderItem({ item, index })}
        </div>
      ))}
    </div>
  );
}

export function Image({ source, style, ...props }: any) {
  return <img src={source?.uri} style={style} {...props} />;
}

export function TextInput({
  value,
  onChangeText,
  placeholder,
  ...props
}: any) {
  return (
    <input
      value={value}
      onChange={(e: any) => onChangeText?.(e.target.value)}
      placeholder={placeholder}
      {...props}
    />
  );
}

export function ScrollView({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export const StyleSheet = {
  create: (styles: any) => styles,
};

export const Platform = {
  OS: "ios" as const,
  select: (obj: any) => obj.ios,
};
