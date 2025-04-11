import React, { useCallback, useRef } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import SearchIcon from '@assets/icons/SearchIcon.svg';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { COLORS } from '@theme/colors';
import clsx from 'clsx';

interface SearchInputProps {
  value: string // Controlled input value
  onChangeText: (text: string) => void // Callback for text change
  placeholder?: string // Optional placeholder text
  placeholderTextColor?: string // Optional placeholder text color
  className?: string // Custom class names for the container
  inputClassName?: string // Custom class names for the input
  iconColor?: string // Custom color for the search icon
  clearIconColor?: string // Custom color for the clear icon
  autoFocus?: boolean
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  placeholderTextColor,
  className,
  inputClassName,
  iconColor,
  autoFocus,
  clearIconColor
}) => {

  const inputRef = useRef<TextInput>(null)
  const { colors } = useColorScheme()

  const clearSearch = useCallback(() => {
    onChangeText('')
    inputRef.current?.focus()
  }, [onChangeText])

  return (
    <View className={clsx('flex flex-row items-center gap-2 p-2 border border-border rounded-lg', className)}>

      {/* Search Icon */}
      <View pointerEvents="none">
        <SearchIcon
          height={20}
          width={20}
          fill={iconColor || colors.greyText}
        />
      </View>

      {/* Search Input */}
      <View className='flex-1'>
        <TextInput
          ref={inputRef}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor || colors.grey}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          autoCapitalize="none"
          autoFocus={autoFocus}
          className={clsx('text-foreground', inputClassName)}
        />
      </View>

      {/* Clear Button (Cross Icon) */}
      {!!value && (
        <Pressable onPress={clearSearch} className='p-0.5 rounded-full bg-slate-500 dark:bg-slate-700'>
          <CrossIcon
            hitSlop={10}
            height={12}
            width={12}
            color={clearIconColor || COLORS.white}
          />
        </Pressable>
      )}
    </View>
  )
}

export default SearchInput