import { animated } from '@react-spring/web'
import { useNodeMouseHandlers } from './hooks-packing'
import { CircleProps } from './types'

export const CircleSvg = <RawData,>({
    node,
    style,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    onClick,
}: CircleProps<RawData>) => {
    const handlers = useNodeMouseHandlers<RawData>(node, {
        onMouseEnter,
        onMouseMove,
        onMouseLeave,
        onClick,
    })

    return (
        <animated.circle
            key={node.id}
            cx={style.x}
            cy={style.y}
            r={style.radius}
            fill={node.fill || style.color}
            stroke={style.borderColor}
            strokeWidth={style.borderWidth}
            opacity={style.opacity}
            onMouseEnter={handlers.onMouseEnter}
            onMouseMove={handlers.onMouseMove}
            onMouseLeave={handlers.onMouseLeave}
            onClick={handlers.onClick}
        />
    )
}
