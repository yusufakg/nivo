import { useInheritedColor, useOrdinalColorScale } from '@nivo/colors'
import { usePropertyAccessor, useTheme } from '@nivo/core'
import cloneDeep from 'lodash/cloneDeep'
import { MouseEvent, useMemo } from 'react'
import { getValidPosition, polarToCartesian, simulatedAnnealing } from './hooks-fns'
import { CirclePackingCommonProps, ComputedDatum, MouseHandlers, RadarCommonProps } from './types'

export const useCirclePacking = <RawData>({
    data,
    id,
    padding,
    colors,
    colorBy,
    inheritColorFromParent,
    childColor,
    radii,
    angles,
    centerX,
    centerY,
    sectorIndices,
    ringIndices,
}: {
    data: CirclePackingCommonProps<RawData>['blipData'] | undefined
    id: CirclePackingCommonProps<RawData>['id']
    padding: CirclePackingCommonProps<RawData>['padding']
    leavesOnly: CirclePackingCommonProps<RawData>['leavesOnly']
    colors: CirclePackingCommonProps<RawData>['colors']
    colorBy: CirclePackingCommonProps<RawData>['colorBy']
    inheritColorFromParent: CirclePackingCommonProps<RawData>['inheritColorFromParent']
    childColor: CirclePackingCommonProps<RawData>['childColor']
    radii: number[]
    angles: number[]
    centerX: number
    centerY: number
    sectorIndices: { index: string; data: string }[]
    ringIndices: { index: string; data: string }[]
    gridShape: RadarCommonProps<RawData>['gridShape'] // TODO: (suggestion) not used, allow calculation of linear gridShape
}): ComputedDatum<RawData>[] => {
    if (!data || data.length === 0) return []

    const getId = usePropertyAccessor<RawData, string>(id)
    const getColor = useOrdinalColorScale<Omit<ComputedDatum<RawData>, 'color' | 'fill'>>(
        colors,
        colorBy
    )
    const theme = useTheme()
    const getChildColor = useInheritedColor<ComputedDatum<RawData>>(childColor, theme)

    const blipRadius = Math.max(...radii) / 20
    const clonedData = cloneDeep(data)
    const nodes: ComputedDatum<RawData>[] = clonedData.map(d => ({
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

    const initialNodesWithColors = nodes.map(descendant => {
        const { positionRadiusBlip, positionAngleBlip } = getValidPosition(
            radii,
            angles,
            sectorIndices,
            ringIndices,
            blipRadius + padding,
            descendant
        )

        const pos = polarToCartesian(centerX, centerY, positionRadiusBlip, positionAngleBlip)

        descendant.x = pos.x
        descendant.y = pos.y
        descendant.radius = blipRadius
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

    const packedNodes = simulatedAnnealing(
        initialNodesWithColors,
        centerX,
        centerY,
        radii,
        angles,
        sectorIndices,
        ringIndices,
        blipRadius + padding
    )

    return packedNodes
}

// TODO: for the (suggestion) in Techradar.tsx
export const useCirclePackingZoom = <RawData>(
    nodes: ComputedDatum<RawData>[],
    zoomedId: CirclePackingCommonProps<RawData>['zoomedId'],
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

// TODO: for the (suggestion) in Techradar.tsx
export const useCirclePackingLabels = <RawData>({
    nodes,
    label,
    filter,
    skipRadius,
    textColor,
}: {
    nodes: ComputedDatum<RawData>[]
    label: CirclePackingCommonProps<RawData>['label']
    filter: CirclePackingCommonProps<RawData>['labelsFilter']
    skipRadius: CirclePackingCommonProps<RawData>['labelsSkipRadius']
    textColor: CirclePackingCommonProps<RawData>['labelTextColor']
}) => {
    const getLabel = usePropertyAccessor<ComputedDatum<RawData>, string | number>(label)
    const theme = useTheme()
    const getTextColor = useInheritedColor<ComputedDatum<RawData>>(textColor, theme)

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

    return useMemo(() => {
        if (!filter) return labels

        return labels.filter(filter)
    }, [labels, filter])
}

// TODO: handlers caused some performance issues, needs to be optimized
export const useNodeMouseHandlers = <RawData>(
    node: ComputedDatum<RawData>,
    { onMouseEnter, onMouseMove, onMouseLeave, onClick }: MouseHandlers<RawData>
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