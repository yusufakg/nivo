import { useInheritedColor } from '@nivo/colors'
import { useMotionConfig, useTheme } from '@nivo/core'
import { useTooltip } from '@nivo/tooltip'
import { SpringValue, to, useTransition } from '@react-spring/web'
import * as React from 'react'
import { MouseEvent, createElement, useMemo } from 'react'
import { CircleComponent, CirclePackingCommonProps, ComputedDatum, MouseHandlers } from './types'

/**
 * A negative radius value is invalid for an SVG circle,
 * this custom interpolation makes sure it's either
 * positive or zero.
 */
export const interpolateRadius = (radiusValue: SpringValue<number>) =>
    to([radiusValue], radius => Math.max(0, radius))

type CirclesProps<RawData> = {
    nodes: ComputedDatum<RawData>[]
    borderWidth: CirclePackingCommonProps<RawData>['borderWidth']
    borderColor: CirclePackingCommonProps<RawData>['borderColor']
    component: CircleComponent<RawData>
    isInteractive: CirclePackingCommonProps<RawData>['isInteractive']
    tooltip: CirclePackingCommonProps<RawData>['tooltip']
} & MouseHandlers<RawData>

const getTransitionPhases = <RawData,>(
    getBorderColor: (node: ComputedDatum<RawData>) => string
) => ({
    enter: (node: ComputedDatum<RawData>) => ({
        x: node.x,
        y: node.y,
        radius: 0,
        color: node.color,
        borderColor: getBorderColor(node),
        opacity: 0,
    }),
    update: (node: ComputedDatum<RawData>) => ({
        x: node.x,
        y: node.y,
        radius: node.radius,
        color: node.color,
        borderColor: getBorderColor(node),
        opacity: 1,
    }),
    leave: (node: ComputedDatum<RawData>) => ({
        x: node.x,
        y: node.y,
        radius: 0,
        color: node.color,
        borderColor: getBorderColor(node),
        opacity: 0,
    }),
})

export const Circles = <RawData,>({
    nodes,
    borderWidth,
    borderColor,
    component,
    isInteractive,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    onClick,
    tooltip,
}: CirclesProps<RawData>) => {
    const { showTooltipFromEvent, hideTooltip } = useTooltip()

    const handleMouseEnter = useMemo(() => {
        if (!isInteractive) return undefined

        return (node: ComputedDatum<RawData>, event: MouseEvent) => {
            showTooltipFromEvent(createElement(tooltip, node), event)
            onMouseEnter?.(node, event)
        }
    }, [isInteractive, showTooltipFromEvent, tooltip, onMouseEnter])

    const handleMouseMove = useMemo(() => {
        if (!isInteractive) return undefined

        return (node: ComputedDatum<RawData>, event: MouseEvent) => {
            showTooltipFromEvent(createElement(tooltip, node), event)
            onMouseMove?.(node, event)
        }
    }, [isInteractive, showTooltipFromEvent, tooltip, onMouseMove])

    const handleMouseLeave = useMemo(() => {
        if (!isInteractive) return undefined

        return (node: ComputedDatum<RawData>, event: MouseEvent) => {
            hideTooltip()
            onMouseLeave?.(node, event)
        }
    }, [isInteractive, hideTooltip, onMouseLeave])

    const handleClick = useMemo(() => {
        if (!isInteractive) return undefined

        return (node: ComputedDatum<RawData>, event: MouseEvent) => {
            onClick?.(node, event)
        }
    }, [isInteractive, onClick])

    const { animate, config: springConfig } = useMotionConfig()

    const theme = useTheme()
    const getBorderColor = useInheritedColor<ComputedDatum<RawData>>(borderColor, theme)

    const transitionPhases = useMemo(
        () => getTransitionPhases<RawData>(getBorderColor),
        [getBorderColor]
    )

    const transition = useTransition<
        ComputedDatum<RawData>,
        {
            x: number
            y: number
            radius: number
            color: string
            borderColor: string
            opacity: number
        }
    >(nodes, {
        keys: node => node.id,
        initial: transitionPhases.update,
        from: transitionPhases.enter,
        enter: transitionPhases.update,
        update: transitionPhases.update,
        leave: transitionPhases.leave,
        config: springConfig,
        immediate: !animate,
    })

    return (
        <>
            {transition((transitionProps, node) => {
                return React.createElement(component, {
                    key: node.id,
                    node,
                    style: {
                        ...transitionProps,
                        radius: interpolateRadius(transitionProps.radius),
                        borderWidth,
                    },
                    onMouseEnter: handleMouseEnter,
                    onMouseMove: handleMouseMove,
                    onMouseLeave: handleMouseLeave,
                    onClick: handleClick,
                })
            })}
        </>
    )
}