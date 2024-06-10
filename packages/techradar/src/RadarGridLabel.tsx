import { useTheme } from '@nivo/core'
import { animated } from '@react-spring/web'
import { GridLabelProps } from './types'

export const RadarGridLabel = ({ id, anchor, animated: animatedProps }: GridLabelProps) => {
    const theme = useTheme()

    return (
        <animated.g transform={animatedProps.transform}>
            <text id={id} style={theme.axis.ticks.text} dominantBaseline="central" textAnchor={anchor}>
                {id}
            </text>
        </animated.g>
    )
}
