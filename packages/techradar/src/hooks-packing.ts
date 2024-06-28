import { useInheritedColor, useOrdinalColorScale } from '@nivo/colors'
import { usePropertyAccessor, useTheme } from '@nivo/core'
import cloneDeep from 'lodash/cloneDeep'
import { MouseEvent, useMemo } from 'react'
import { CirclePackingCommonProps, ComputedDatum, MouseHandlers, RadarCommonProps } from './types'

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
    return (outerRadius - innerRadius) / 20
}

const calculateOverlapDistance = (x1: number, y1: number, x2: number, y2: number) => {
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    return Math.max(0, 2 - distance)
}

const calculateElasticEnergy = (nodes: any[], containerRadius: number) => {
    let totalEnergy = 0
    nodes.forEach((node, i) => {
        nodes.forEach((otherNode, j) => {
            if (i !== j) {
                const overlapDistance = calculateOverlapDistance(
                    node.x,
                    node.y,
                    otherNode.x,
                    otherNode.y
                )
                totalEnergy += overlapDistance ** 2
            }
        })
        const distanceToCenter = Math.sqrt(node.x ** 2 + node.y ** 2)
        const overlapToContainer = Math.max(0, distanceToCenter + 1 - containerRadius)
        totalEnergy += overlapToContainer ** 2
    })
    return totalEnergy
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
    centerX,
    centerY,
    sectorData,
    ringData,
    gridShape,
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
    centerX: number
    centerY: number
    sectorData: any[]
    ringData: any[]
    gridShape: RadarCommonProps<RawDatum>['gridShape']
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
    const nodes: ComputedDatum<RawDatum>[] = clonedData.map(d => ({
        data: d,
        value: 1,
        depth: 1,
        height: 0,
        parent: undefined,
        id: getId(d),
        path: [],
        percentage: 0,
        formattedValue: '',
        x: 0,
        y: 0,
        radius: 0,
        color: '',
        fill: undefined,
    }))

    const computedNodesWithColors = nodes.map(descendant => {
        const sectorIndex = sectorData.findIndex(sd => sd.index === (descendant.data as any).sector)
        const ringIndex = ringData.findIndex(rd => rd.index === (descendant.data as any).ring)

        const startAngle = angles[sectorIndex]
        const endAngle =
            sectorIndex === sectorData.length - 1
                ? angles[0] + 2 * Math.PI
                : angles[(sectorIndex + 1) % angles.length]
        const angle = startAngle + Math.random() * (endAngle - startAngle)

        const startRadius = radii[ringIndex]
        const endRadius = radii[ringIndex + 1]
        const radius = startRadius + Math.random() * (endRadius - startRadius)
        const pos = polarToCartesian(centerX, centerY, radius, angle)
        const x = pos.x
        const y = pos.y

        descendant.x = x
        descendant.y = y
        descendant.radius = calculateRadius(Math.max(...radii), padding)
        descendant.color = getColor(descendant)

        if (inheritColorFromParent && descendant.depth > 1) {
            const parentNode = nodes.find(
                node => node.id === getId((descendant as any).data.parent)
            )
            descendant.color = parentNode ? getChildColor(parentNode) : getColor(descendant)
        } else {
            descendant.color = getColor(descendant)
        }

        return descendant
    })

    return computedNodesWithColors
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
