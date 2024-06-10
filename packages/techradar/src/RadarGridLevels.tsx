import { useAnimatedPath, useMotionConfig, useTheme } from '@nivo/core'
import { animated, to, useSpring } from '@react-spring/web'
import { curveLinearClosed, lineRadial } from 'd3-shape'
import { SVGProps, memo, useMemo } from 'react'
import { RadarCommonProps } from './types'

interface RadarGridLevelCircularProps {
    radius: number
}

const RadarGridLevelCircular = memo(({ radius }: RadarGridLevelCircularProps) => {
    const theme = useTheme()
    const { animate, config: springConfig } = useMotionConfig()

    const animatedProps = useSpring({
        radius,
        config: springConfig,
        immediate: !animate,
    })

    return (
        <animated.circle
            fill="none"
            r={to(animatedProps.radius, value => Math.max(value, 0))}
            {...(theme.grid.line as Omit<SVGProps<SVGCircleElement>, 'ref'>)}
        />
    )
})

interface RadarGridLevelLinearProps {
    radius: number
    rotation: number
    angleStep: number
    dataLength: number
}

const RadarGridLevelLinear = ({
    radius,
    rotation,
    angleStep,
    dataLength,
}: RadarGridLevelLinearProps) => {
    const theme = useTheme()

    const radarLineGenerator = useMemo(
        () =>
            lineRadial<number>()
                .angle(i => rotation + i * angleStep)
                .radius(radius)
                .curve(curveLinearClosed),
        [rotation, angleStep, radius]
    )

    const points = Array.from({ length: dataLength }, (_, i) => i)
    const animatedPath = useAnimatedPath(radarLineGenerator(points) as string)

    return (
        <animated.path
            fill="none"
            d={animatedPath}
            {...(theme.grid.line as Omit<SVGProps<SVGPathElement>, 'ref'>)}
        />
    )
}

interface RadarGridLevelsProps {
    shape: RadarCommonProps['gridShape']
    radius: number
    rotation: number
    angleStep: number
    dataLength: number
}

export const RadarGridLevels = ({ shape, ...props }: RadarGridLevelsProps) => {
    return shape === 'circular' ? (
        <RadarGridLevelCircular radius={props.radius} />
    ) : (
        <RadarGridLevelLinear {...props} />
    )
}
