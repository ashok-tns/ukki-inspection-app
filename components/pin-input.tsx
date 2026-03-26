import React, { useRef, useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'

interface PinInputProps {
  length?: number
  onComplete: (pin: string) => void
  onChanged?: (pin: string) => void
  disabled?: boolean
}

export function PinInput({ length = 6, onComplete, onChanged, disabled }: PinInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''))
  const inputs = useRef<(TextInput | null)[]>([])

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1)
    const next = [...values]
    next[index] = digit
    setValues(next)

    const pin = next.join('')
    onChanged?.(pin)

    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus()
    }
    if (pin.length === length && next.every(Boolean)) {
      onComplete(pin)
    }
  }

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !values[index] && index > 0) {
      const next = [...values]
      next[index - 1] = ''
      setValues(next)
      inputs.current[index - 1]?.focus()
    }
  }

  return (
    <View style={styles.container}>
      {Array(length)
        .fill(null)
        .map((_, i) => (
          <TextInput
            key={i}
            ref={(el) => {
              inputs.current[i] = el
            }}
            style={[styles.box, values[i] ? styles.boxFilled : styles.boxEmpty]}
            value={values[i]}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            keyboardType="numeric"
            maxLength={1}
            secureTextEntry
            editable={!disabled}
            selectTextOnFocus
            textAlign="center"
          />
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  boxEmpty: {
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  boxFilled: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
})
