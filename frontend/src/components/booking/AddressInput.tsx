import React, { useRef, useEffect, useCallback } from "react";
import { MapPin } from "lucide-react";
import { GOOGLE_MAPS_API_KEY } from "config";
import { useGoogleMaps } from "hooks/useGoogleMaps";

interface AddressInputProps {
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AddressInput({
  value,
  onChange,
  placeholder = "Enter address",
  disabled,
}: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<unknown>(null);
  const { isLoaded } = useGoogleMaps(GOOGLE_MAPS_API_KEY);

  const handlePlaceChanged = useCallback(
    (address: string) => {
      onChange(address);
    },
    [onChange]
  );

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;
    if (!window.google?.maps?.places) return;

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "nz" },
      fields: ["formatted_address", "name"],
    });

    autocompleteRef.current = ac;

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const address = place.formatted_address || place.name || "";
      handlePlaceChanged(address);
    });
  }, [isLoaded, handlePlaceChanged]);

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        className="flex h-9 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        placeholder={placeholder}
        defaultValue={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}
