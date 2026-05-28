import { View, Text, Pressable } from "react-native";
import type { DriverInfo } from "../../types/ride";
import Card from "../ui/Card";

interface DriverInfoCardProps {
  driver: DriverInfo;
  onCall?: () => void;
  onMessage?: () => void;
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <View className="flex-row items-center">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Text key={`full-${i}`} className="text-yellow-500 text-xs">
          {"\u2605"}
        </Text>
      ))}
      {hasHalf && (
        <Text className="text-yellow-500 text-xs">{"\u00BD"}</Text>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Text key={`empty-${i}`} className="text-gray-300 text-xs">
          {"\u2605"}
        </Text>
      ))}
      <Text className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</Text>
    </View>
  );
}

export default function DriverInfoCard({
  driver,
  onCall,
  onMessage,
}: DriverInfoCardProps) {
  return (
    <Card className="mb-4">
      {/* Driver header */}
      <View className="flex-row items-center">
        {/* Avatar placeholder */}
        <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-3">
          <Text className="text-xl font-bold text-gray-600">
            {driver.fullName.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Name and rating */}
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900">
            {driver.fullName}
          </Text>
          <StarRating rating={driver.rating} />
          <Text className="text-xs text-gray-400 mt-0.5">
            {driver.totalRides.toLocaleString()} rides
          </Text>
        </View>
      </View>

      {/* Vehicle info */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <View className="flex-1">
          <Text className="text-xs text-gray-400 uppercase">Vehicle</Text>
          <Text className="text-sm font-medium text-gray-900 mt-0.5">
            {driver.vehicleColor} {driver.vehicleMake} {driver.vehicleModel}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-400 uppercase">Plate</Text>
          <View className="bg-gray-100 rounded px-2 py-0.5 mt-0.5">
            <Text className="text-sm font-semibold text-gray-900 tracking-wider">
              {driver.licensePlate}
            </Text>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-3 mt-3 pt-3 border-t border-gray-100">
        <Pressable
          onPress={onCall}
          className="flex-1 flex-row items-center justify-center bg-gray-100 rounded-full py-2.5 active:bg-gray-200"
        >
          <Text className="text-base mr-1.5">{"\u260E"}</Text>
          <Text className="text-sm font-semibold text-gray-900">Call</Text>
        </Pressable>
        <Pressable
          onPress={onMessage}
          className="flex-1 flex-row items-center justify-center bg-gray-100 rounded-full py-2.5 active:bg-gray-200"
        >
          <Text className="text-base mr-1.5">{"\u2709"}</Text>
          <Text className="text-sm font-semibold text-gray-900">Message</Text>
        </Pressable>
      </View>
    </Card>
  );
}
