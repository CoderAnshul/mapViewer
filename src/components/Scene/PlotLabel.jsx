import { Text } from '@react-three/drei';

export default function PlotLabel({ position, text, subText, color = '#1a1200', opacity = 1, scale = [2, 2.2, 1] }) {
  return (
    <Text
      position={position}
      text={String(text)}
      fontSize={0.8}
      color={color}
      anchorX="center"
      anchorY="middle"
      fillOpacity={opacity}
      billboard
    >
      {subText && (
        <Text
          position={[0, -0.4, 0]}
          text={String(subText)}
          fontSize={0.3}
          color={color}
          fillOpacity={opacity * 0.6}
        />
      )}
    </Text>
  );
}

export function SurfaceLabel({ position, rotation = [-Math.PI / 2, 0, 0], text, subText, extraText, color = '#201800', opacity = 0.8, scale = [1, 1, 1] }) {
  const s = scale[0];
  
  return (
    <group position={position} rotation={rotation} scale={[s, s, s]}>
      {/* Main Plot Number */}
      <Text
        text={String(text)}
        fontSize={0.8}
        color={color}
        anchorX="center"
        anchorY="middle"
        fillOpacity={opacity}
        // Offset based on whether we have subtexts
        position={[0, extraText ? 0.35 : (subText ? 0.2 : 0), 0.01]}
      />
      
      {/* Square Metres */}
      {subText && (
        <Text
          text={String(subText)}
          fontSize={0.25}
          color={color}
          anchorX="center"
          anchorY="middle"
          fillOpacity={opacity * 0.7}
          position={[0, extraText ? -0.1 : -0.35, 0.01]}
        />
      )}

      {/* Square Feet */}
      {extraText && (
        <Text
          text={String(extraText)}
          fontSize={0.3}
          color={color}
          anchorX="center"
          anchorY="middle"
          fillOpacity={opacity}
          position={[0, -0.45, 0.01]}
        />
      )}
    </group>
  );
}

export function FlatLabel({ position, rotation = [-Math.PI / 2, 0, 0], text, color = '#777777', scale = [1, 1, 1], opacity = 0.6 }) {
  return (
    <Text
      position={position}
      rotation={rotation}
      text={text.toUpperCase()}
      fontSize={scale[1] * 0.5}
      color={color}
      anchorX="center"
      anchorY="middle"
      fillOpacity={opacity}
      letterSpacing={0.1}
    />
  );
}

