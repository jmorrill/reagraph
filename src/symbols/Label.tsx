import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Billboard, Text, RoundedBox } from 'glodrei';
import { Box3, Color, ColorRepresentation, Euler, Vector3 } from 'three';
import ellipsize from 'ellipsize';
import { useFrame } from '@react-three/fiber';

export interface LabelProps {
    /**
     * Text to render.
     */
    text: string;

    /**
     * Font URL.
     * Reference: https://github.com/reaviz/reagraph/issues/23
     */
    fontUrl?: string;

    /**
     * Size of the font.
     */
    fontSize?: number;

    /**
     * Color of the text.
     */
    color?: ColorRepresentation;

    /**
     * Stroke of the text.
     */
    stroke?: ColorRepresentation;

    /**
     * Opacity for the label.
     */
    opacity?: number;

    /**
     * The lenth of which to start the ellipsis.
     */
    ellipsis?: number;

    /**
     * Whether the label is active ( dragging, hover, focus ).
     */
    active?: boolean;

    /**
     * Rotation of the label.
     */
    rotation?: Euler | [number, number, number];

    /**
     * Background color of the label.
     */
    background?: ColorRepresentation;
}

function roundToSixDecimals(value: number): number {
    return Math.round(value * 1e4) / 1e4;
}

function compareRoundedNumbers(num1: number, num2: number): boolean {
    const roundedNum1 = roundToSixDecimals(num1);
    const roundedNum2 = roundToSixDecimals(num2);
    return roundedNum1 === roundedNum2;
}

export const Label: FC<LabelProps> = ({
    text,
    fontSize,
    fontUrl,
    color,
    opacity,
    stroke,
    active,
    ellipsis,
    rotation,
    background
}) => {
    const shortText = ellipsis && !active ? ellipsize(text, ellipsis) : text;
    const normalizedColor = useMemo(() => new Color(color), [color]);
    const normalizedStroke = useMemo(
        () => (stroke ? new Color(stroke) : undefined),
        [stroke]
    );

    const normalizedBackground = useMemo(() => new Color(background), [background]);

    const textRef = useRef(null);
    const [textSize, setTextSize] = useState<Vector3>(new Vector3(0, 0, 0));

    useFrame(() => {
        if (textRef.current) {
            const box = new Box3().setFromObject(textRef.current);
            const size = new Vector3();
            box.getSize(size);

            if (!compareRoundedNumbers(size.x, textSize.x) || !compareRoundedNumbers(size.y, textSize.y)) {
                setTextSize(size);
            }
        }
    });

    return (
        <Billboard position={[0, 0, 1]}>
            <group>
                {
                    background && (
                        <RoundedBox
                            args={[Math.max(textSize.x + (textSize.x * 0.075), 8), Math.max(textSize.y + (textSize.y * 0.085), 8), 0]}
                            rotation={rotation}
                            radius={2.05}
                            smoothness={4}
                            position={[0, 0, 0]}
                        >
                            <meshLambertMaterial attach="material" color={normalizedBackground} />
                        </RoundedBox>
                    )
                }
                <Text
                    ref={textRef}
                    font={fontUrl}
                    fontSize={fontSize}
                    color={normalizedColor}
                    fillOpacity={opacity}
                    textAlign="center"
                    outlineWidth={stroke ? 1 : 0}
                    outlineColor={normalizedStroke}
                    depthOffset={0}
                    maxWidth={100}
                    overflowWrap="break-word"
                    rotation={rotation}
                >
                    {shortText}
                </Text>
            </group>
        </Billboard>

    );
};

Label.defaultProps = {
    opacity: 1,
    fontSize: 7,
    color: '#2A6475',
    ellipsis: 75
};
