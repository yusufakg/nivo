import { useInheritedColor, useOrdinalColorScale } from '@nivo/colors'
import { degreesToRadians, usePropertyAccessor, useTheme } from '@nivo/core'
import { hierarchy as d3Hierarchy } from 'd3-hierarchy'
import { scaleLinear } from 'd3-scale'
import cloneDeep from 'lodash/cloneDeep'
import sortBy from 'lodash/sortBy'
import { MouseEvent, useMemo } from 'react'
import {
    CirclePackingCommonProps,
    ComputedDatum,
    MouseHandlers,
    RadarCommonProps,
    RadarDataProps,
} from './types'

export const useRadar = <RawDatum>({
    sectorData,
    ringData,
    rotationDegrees,
    width,
    height,
}: {
    sectorData: RadarDataProps['sectorData']
    ringData: RadarDataProps['ringData']
    rotationDegrees: RadarCommonProps<RawDatum>['rotation']
    width: number
    height: number
    colors: RadarCommonProps<RawDatum>['colors']
}) => {
    const sectorIndices = useMemo(
        () => sectorData.map((data, i) => ({ index: `s${i.toString()}`, data })),
        [sectorData]
    )
    const ringIndices = useMemo(
        () => ringData.map((data, i) => ({ index: `r${i.toString()}`, data })),
        [ringData]
    )
    const rotation = degreesToRadians(rotationDegrees)

    const { radius, radiusScale, centerX, centerY, angleStep } = useMemo(() => {
        const radius = Math.min(width, height) / 2
        const radiusScale = scaleLinear<number, number>().range([0, radius])

        return {
            radius,
            radiusScale,
            centerX: width / 2,
            centerY: height / 2,
            angleStep: (Math.PI * 2) / sectorData.length,
        }
    }, [sectorData, width, height])

    return {
        sectorIndices,
        ringIndices,
        rotation,
        radius,
        radiusScale,
        centerX,
        centerY,
        angleStep,
    }
}

const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInRadians: number
): { x: number; y: number } => {
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    }
}

const calculateRadius = (outerRadius: number, padding: number) => {
    const innerRadius = outerRadius * padding
    return (outerRadius - innerRadius) / 10
}

export const useCirclePacking = <RawDatum>({
    data,
    id,
    padding,
    leavesOnly,
    colors,
    colorBy,
    inheritColorFromParent,
    childColor,
    radii,
    angles,
}: {
    data: CirclePackingCommonProps<RawDatum>['blipData'] | undefined
    id: CirclePackingCommonProps<RawDatum>['id']
    padding: CirclePackingCommonProps<RawDatum>['padding']
    leavesOnly: CirclePackingCommonProps<RawDatum>['leavesOnly']
    colors: CirclePackingCommonProps<RawDatum>['colors']
    colorBy: CirclePackingCommonProps<RawDatum>['colorBy']
    inheritColorFromParent: CirclePackingCommonProps<RawDatum>['inheritColorFromParent']
    childColor: CirclePackingCommonProps<RawDatum>['childColor']
    radii: number[]
    angles: number[]
}): ComputedDatum<RawDatum>[] => {
    if (!data) return []

    const getId = usePropertyAccessor<RawDatum, string>(id)
    const getColor = useOrdinalColorScale<Omit<ComputedDatum<RawDatum>, 'color' | 'fill'>>(
        colors,
        colorBy
    )
    const theme = useTheme()
    const getChildColor = useInheritedColor<ComputedDatum<RawDatum>>(childColor, theme)

    const clonedData = cloneDeep(data)
    const hierarchy = d3Hierarchy<RawDatum>(clonedData).sum(() => 1)
    const nodes = leavesOnly ? hierarchy.leaves() : hierarchy.descendants()

    const sortedNodes = sortBy(nodes, 'depth')
    const circleRadius = calculateRadius(Math.max(...radii), padding)

    const computedNodes = sortedNodes.map((descendant, index) => {
        const id = getId(descendant.data)
        const value = descendant.value!
        const path = descendant.ancestors().map(ancestor => getId(ancestor.data))
        const angleIndex = index % angles.length
        const radiusIndex = Math.floor(index / angles.length) % radii.length

        const pos = polarToCartesian(0, 0, radii[radiusIndex], degreesToRadians(angles[angleIndex]))
        const x = pos.x
        const y = pos.y

        const normalizedNode: ComputedDatum<RawDatum> = {
            id,
            path,
            value,
            percentage: 0,
            formattedValue: `${value}`,
            x,
            y,
            radius: circleRadius,
            color: '',
            data: descendant.data,
            depth: descendant.depth,
            height: descendant.height,
        }

        if (inheritColorFromParent && descendant.parent) {
            const parentNode = computedNodes.find(
                node => node.id === getId(descendant.parent!.data)
            )
            normalizedNode.color = parentNode ? getChildColor(parentNode) : getColor(normalizedNode)
        } else {
            normalizedNode.color = getColor(normalizedNode)
        }

        return normalizedNode
    })

    return computedNodes
}

export const useCirclePackingZoom = <RawDatum>(
    nodes: ComputedDatum<RawDatum>[],
    zoomedId: CirclePackingCommonProps<RawDatum>['zoomedId'],
    width: number,
    height: number
) =>
    useMemo(() => {
        if (!zoomedId) return nodes

        const zoomedNode = nodes.find(({ id }) => id === zoomedId)
        if (!zoomedNode) return nodes

        const ratio = Math.min(width, height) / (zoomedNode.radius * 2)
        const offsetX = width / 2 - zoomedNode.x * ratio
        const offsetY = height / 2 - zoomedNode.y * ratio

        return nodes.map(node => ({
            ...node,
            x: node.x * ratio + offsetX,
            y: node.y * ratio + offsetY,
            radius: node.radius * ratio,
        }))
    }, [nodes, zoomedId, width, height])

export const useCirclePackingLabels = <RawDatum>({
    nodes,
    label,
    filter,
    skipRadius,
    textColor,
}: {
    nodes: ComputedDatum<RawDatum>[]
    label: CirclePackingCommonProps<RawDatum>['label']
    filter: CirclePackingCommonProps<RawDatum>['labelsFilter']
    skipRadius: CirclePackingCommonProps<RawDatum>['labelsSkipRadius']
    textColor: CirclePackingCommonProps<RawDatum>['labelTextColor']
}) => {
    const getLabel = usePropertyAccessor<ComputedDatum<RawDatum>, string | number>(label)
    const theme = useTheme()
    const getTextColor = useInheritedColor<ComputedDatum<RawDatum>>(textColor, theme)

    // computing the labels
    const labels = useMemo(
        () =>
            nodes
                .filter(node => node.radius >= skipRadius)
                .map(node => ({
                    label: getLabel(node),
                    textColor: getTextColor(node),
                    node,
                })),
        [nodes, skipRadius, getLabel, getTextColor]
    )

    // apply extra filtering if provided
    return useMemo(() => {
        if (!filter) return labels

        return labels.filter(filter)
    }, [labels, filter])
}

export const useNodeMouseHandlers = <RawDatum>(
    node: ComputedDatum<RawDatum>,
    { onMouseEnter, onMouseMove, onMouseLeave, onClick }: MouseHandlers<RawDatum>
): Partial<
    Record<'onMouseEnter' | 'onMouseMove' | 'onMouseLeave' | 'onClick', (event: MouseEvent) => void>
> =>
    useMemo(
        () => ({
            onMouseEnter: onMouseEnter
                ? (event: MouseEvent) => {
                      onMouseEnter(node, event)
                  }
                : undefined,
            onMouseMove: onMouseMove
                ? (event: MouseEvent) => {
                      onMouseMove(node, event)
                  }
                : undefined,
            onMouseLeave: onMouseLeave
                ? (event: MouseEvent) => {
                      onMouseLeave(node, event)
                  }
                : undefined,
            onClick: onClick
                ? (event: MouseEvent) => {
                      onClick(node, event)
                  }
                : undefined,
        }),
        [node, onMouseEnter, onMouseMove, onMouseLeave, onClick]
    )
