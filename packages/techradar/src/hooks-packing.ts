import { useInheritedColor, useOrdinalColorScale } from '@nivo/colors'
import { usePropertyAccessor, useTheme } from '@nivo/core'
import cloneDeep from 'lodash/cloneDeep'
import { MouseEvent, useMemo } from 'react'
import { getValidPosition, polarToCartesian, simulatedAnnealing } from './hooks-fns'
import { CirclePackingCommonProps, ComputedDatum, MouseHandlers, RadarCommonProps } from './types'

export const useCirclePacking = <RawDatum>({
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
    sectorData,
    ringData,
    // leavesOnly, TODO: not now
    // gridShape, TODO: not now
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

    const blipRadius = Math.max(...radii) / 20
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

    const initialNodesWithColors = nodes.map(descendant => {
        const { positionRadiusBlip, positionAngleBlip } = getValidPosition(
            radii,
            angles,
            sectorData,
            ringData,
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
        sectorData,
        ringData,
        blipRadius + padding
    )

    return packedNodes
}

// TODO: not tested
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

// TODO: not tested
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

// TODO: not tested
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
