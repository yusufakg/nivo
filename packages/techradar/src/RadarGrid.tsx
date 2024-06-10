import { positionFromAngle, useTheme } from '@nivo/core'
import { SVGProps, useMemo } from 'react'
import { RadarGridLabels } from './RadarGridLabels'
import { RadarGridLevels } from './RadarGridLevels'
import { GridLabelComponent, RadarCommonProps } from './types'

interface RadarGridProps {
    indices: string[]
    shape: RadarCommonProps['gridShape']
    radius: number
    levels: number
    rotation: number
    angleStep: number
    label: GridLabelComponent
    labelOffset: number
}

export const RadarGrid = ({
    indices,
    levels,
    shape,
    radius,
    rotation,
    angleStep,
    label,
    labelOffset,
}: RadarGridProps) => {
    const theme = useTheme()
    const { radii, angles, labelAngles } = useMemo(() => {
        return {
            radii: Array.from({ length: levels })
                .map((_, i) => (radius / levels) * (i + 1))
                .reverse(),
            angles: Array.from({ length: indices.length }).map(
                (_, i) => rotation + i * angleStep - Math.PI / 2
            ),
            labelAngles: Array.from({ length: indices.length }).map(
                (_, i) => rotation + i * angleStep - Math.PI / 2 + angleStep / 2
            ),
        }
    }, [indices, levels, radius, rotation, angleStep])

    return (
        <>
            {angles.map((angle, i) => {
                const position = positionFromAngle(angle, radius)
                return (
                    <line
                        key={`axis.${i}`}
                        x1={0}
                        y1={0}
                        x2={position.x}
                        y2={position.y}
                        {...(theme.grid.line as SVGProps<SVGLineElement>)}
                    />
                )
            })}
            {radii.map((radius, i) => (
                <RadarGridLevels
                    key={`level.${i}`}
                    shape={shape}
                    radius={radius}
                    rotation={rotation}
                    angleStep={angleStep}
                    dataLength={indices.length}
                />
            ))}
            <RadarGridLabels
                radius={radius}
                angles={labelAngles}
                indices={indices}
                labelOffset={labelOffset}
                label={label}
            />
        </>
    )
}
