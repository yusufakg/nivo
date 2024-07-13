import { useMotionConfig } from '@nivo/core'
import { useTransition } from '@react-spring/web'
import { createElement, useMemo } from 'react'
import { interpolateRadius } from './Circles'
import { useCirclePackingLabels } from './hooks-packing'
import { CirclePackingCommonProps, ComputedDatum, ComputedLabel, LabelComponent } from './types'

interface CirclesProps<RawData> {
    nodes: ComputedDatum<RawData>[]
    label: CirclePackingCommonProps<RawData>['label']
    filter?: CirclePackingCommonProps<RawData>['labelsFilter']
    skipRadius: CirclePackingCommonProps<RawData>['labelsSkipRadius']
    textColor: CirclePackingCommonProps<RawData>['labelTextColor']
    component: LabelComponent<RawData>
}

const getTransitionPhases = <RawData,>() => ({
    enter: (label: ComputedLabel<RawData>) => ({
        x: label.node.x,
        y: label.node.y,
        radius: label.node.radius,
        textColor: label.textColor,
        opacity: 0,
    }),
    update: (label: ComputedLabel<RawData>) => ({
        x: label.node.x,
        y: label.node.y,
        radius: label.node.radius,
        textColor: label.textColor,
        opacity: 1,
    }),
    leave: (label: ComputedLabel<RawData>) => ({
        x: label.node.x,
        y: label.node.y,
        radius: label.node.radius,
        textColor: label.textColor,
        opacity: 0,
    }),
})

export const Labels = <RawData,>({
    nodes,
    label,
    filter,
    skipRadius,
    textColor,
    component,
}: CirclesProps<RawData>) => {
    const { animate, config: springConfig } = useMotionConfig()

    const labels = useCirclePackingLabels({
        nodes,
        label,
        filter,
        skipRadius,
        textColor,
    })

    const transitionPhases = useMemo(() => getTransitionPhases<RawData>(), [])

    const transition = useTransition<
        ComputedLabel<RawData>,
        {
            x: number
            y: number
            radius: number
            textColor: string
            opacity: number
        }
    >(labels, {
        keys: label => label.node.id,
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
            {transition((transitionProps, label) => {
                return createElement(component, {
                    key: label.node.id,
                    label: label.label,
                    style: {
                        ...transitionProps,
                        radius: interpolateRadius(transitionProps.radius),
                    },
                    node: label.node,
                })
            })}
        </>
    )
}
