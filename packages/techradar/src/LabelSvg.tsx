import { useTheme } from '@nivo/core'
import { animated } from '@react-spring/web'
import { LabelProps } from './types'

export const LabelSvg = <RawData,>({ node, label, style }: LabelProps<RawData>) => {
    const theme = useTheme()

    return (
        <animated.text
            key={node.id}
            x={style.x}
            y={style.y}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
                ...theme.labels.text,
                fill: style.textColor,
                opacity: style.opacity,
                pointerEvents: 'none',
            }}
        >
            {label}
        </animated.text>
    )
}
