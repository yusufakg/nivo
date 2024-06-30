import { useInheritedColor, useOrdinalColorScale } from '@nivo/colors'
import { usePropertyAccessor, useTheme } from '@nivo/core'
import cloneDeep from 'lodash/cloneDeep'
import { CirclePackingCommonProps, ComputedDatum, RadarCommonProps } from './types'

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

const calculateEnergy = (nodes: ComputedDatum<any>[]) => {
    let energy = 0
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x
            const dy = nodes[i].y - nodes[j].y
            const distance = Math.sqrt(dx * dx + dy * dy)
            const minDistance = nodes[i].radius + nodes[j].radius
            if (distance < minDistance) {
                energy += minDistance - distance
            }
        }
    }
    return energy
}

const getValidPosition = (
    radii: number[],
    angles: number[],
    sectorData: any[],
    ringData: any[],
    blipRadius: number,
    randomNode: ComputedDatum<any>
) => {
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
    const getRandomRadius = (start: number, end: number) => start + Math.random() * (end - start)
    const getSectorAngles = (
        angles: number[],
        sectorIndex: number,
        sectorDataLength: number,
        blipRadius: number,
        positionRadiusBlip: number
    ) => {
        const deltaTheta = Math.asin(blipRadius / positionRadiusBlip)
        const startAngle = angles[sectorIndex] + deltaTheta
        const endAngle =
            (sectorIndex === sectorDataLength - 1
                ? angles[0] + 2 * Math.PI
                : angles[(sectorIndex + 1) % angles.length]) - deltaTheta
        return { startAngle, endAngle }
    }

    const ringIndex = ringData.findIndex(rd => rd.index === randomNode.data.ring)
    const startRadiusSector = radii[ringIndex] + blipRadius
    const endRadiusSector = radii[ringIndex + 1] - blipRadius

    let positionRadiusBlip = getRandomRadius(startRadiusSector, endRadiusSector)
    let positionAngleBlip: number

    if (sectorData.length === 0) {
        positionAngleBlip = Math.random() * 2 * Math.PI
    } else if (sectorData.length === 1) {
        const { startAngle, endAngle } = getSectorAngles(
            angles,
            0,
            sectorData.length,
            blipRadius,
            positionRadiusBlip
        )
        positionAngleBlip = clamp(getRandomRadius(startAngle, endAngle), startAngle, endAngle)
        positionRadiusBlip = clamp(positionRadiusBlip, startRadiusSector, endRadiusSector)
    } else {
        const sectorIndex = sectorData.findIndex(sd => sd.index === randomNode.data.sector)
        const sectorAngleSpan =
            sectorIndex === sectorData.length - 1
                ? angles[0] + 2 * Math.PI - angles[sectorIndex]
                : angles[(sectorIndex + 1) % angles.length] - angles[sectorIndex]
        const minStartRadiusSector = blipRadius / Math.sin(sectorAngleSpan / 2)
        const adjustedStartRadiusSector = Math.max(minStartRadiusSector, startRadiusSector)

        positionRadiusBlip = getRandomRadius(adjustedStartRadiusSector, endRadiusSector)
        const { startAngle, endAngle } = getSectorAngles(
            angles,
            sectorIndex,
            sectorData.length,
            blipRadius,
            positionRadiusBlip
        )
        positionAngleBlip = clamp(getRandomRadius(startAngle, endAngle), startAngle, endAngle)
        positionRadiusBlip = clamp(positionRadiusBlip, adjustedStartRadiusSector, endRadiusSector)
    }

    return { positionRadiusBlip, positionAngleBlip }
}

const simulatedAnnealing = (
    nodes: ComputedDatum<any>[],
    centerX: number,
    centerY: number,
    radii: number[],
    angles: number[],
    sectorData: any[],
    ringData: any[],
    blipRadius: number
) => {
    const initialTemperature = 1000
    const coolingRate = 0.003
    let temperature = initialTemperature

    let currentSolution = cloneDeep(nodes)
    let currentEnergy = calculateEnergy(currentSolution)
    let bestSolution = cloneDeep(currentSolution)
    let bestEnergy = currentEnergy

    while (temperature > 1) {
        const newSolution = cloneDeep(currentSolution)
        const randomNodeIndex = Math.floor(Math.random() * newSolution.length)
        const randomNode = newSolution[randomNodeIndex]

        const { positionRadiusBlip, positionAngleBlip } = getValidPosition(
            radii,
            angles,
            sectorData,
            ringData,
            blipRadius,
            randomNode
        )

        const pos = polarToCartesian(centerX, centerY, positionRadiusBlip, positionAngleBlip)

        randomNode.x = pos.x
        randomNode.y = pos.y

        const newEnergy = calculateEnergy(newSolution)
        const energyDifference = newEnergy - currentEnergy

        if (energyDifference < 0 || Math.exp(-energyDifference / temperature) > Math.random()) {
            currentSolution = newSolution
            currentEnergy = newEnergy
            if (newEnergy < bestEnergy) {
                bestSolution = newSolution
                bestEnergy = newEnergy
            }
        }

        temperature *= 1 - coolingRate
    }

    return bestSolution
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
            blipRadius,
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
        blipRadius
    )

    return packedNodes
}

// export const useCirclePackingZoom = <RawDatum>(
//     nodes: ComputedDatum<RawDatum>[],
//     zoomedId: CirclePackingCommonProps<RawDatum>['zoomedId'],
//     width: number,
//     height: number
// ) =>
//     useMemo(() => {
//         if (!zoomedId) return nodes

//         const zoomedNode = nodes.find(({ id }) => id === zoomedId)
//         if (!zoomedNode) return nodes

//         const ratio = Math.min(width, height) / (zoomedNode.radius * 2)
//         const offsetX = width / 2 - zoomedNode.x * ratio
//         const offsetY = height / 2 - zoomedNode.y * ratio

//         return nodes.map(node => ({
//             ...node,
//             x: node.x * ratio + offsetX,
//             y: node.y * ratio + offsetY,
//             radius: node.radius * ratio,
//         }))
//     }, [nodes, zoomedId, width, height])

// export const useCirclePackingLabels = <RawDatum>({
//     nodes,
//     label,
//     filter,
//     skipRadius,
//     textColor,
// }: {
//     nodes: ComputedDatum<RawDatum>[]
//     label: CirclePackingCommonProps<RawDatum>['label']
//     filter: CirclePackingCommonProps<RawDatum>['labelsFilter']
//     skipRadius: CirclePackingCommonProps<RawDatum>['labelsSkipRadius']
//     textColor: CirclePackingCommonProps<RawDatum>['labelTextColor']
// }) => {
//     const getLabel = usePropertyAccessor<ComputedDatum<RawDatum>, string | number>(label)
//     const theme = useTheme()
//     const getTextColor = useInheritedColor<ComputedDatum<RawDatum>>(textColor, theme)

//     // computing the labels
//     const labels = useMemo(
//         () =>
//             nodes
//                 .filter(node => node.radius >= skipRadius)
//                 .map(node => ({
//                     label: getLabel(node),
//                     textColor: getTextColor(node),
//                     node,
//                 })),
//         [nodes, skipRadius, getLabel, getTextColor]
//     )

//     // apply extra filtering if provided
//     return useMemo(() => {
//         if (!filter) return labels

//         return labels.filter(filter)
//     }, [labels, filter])
// }

// export const useNodeMouseHandlers = <RawDatum>(
//     node: ComputedDatum<RawDatum>,
//     { onMouseEnter, onMouseMove, onMouseLeave, onClick }: MouseHandlers<RawDatum>
// ): Partial<
//     Record<'onMouseEnter' | 'onMouseMove' | 'onMouseLeave' | 'onClick', (event: MouseEvent) => void>
// > =>
//     useMemo(
//         () => ({
//             onMouseEnter: onMouseEnter
//                 ? (event: MouseEvent) => {
//                       onMouseEnter(node, event)
//                   }
//                 : undefined,
//             onMouseMove: onMouseMove
//                 ? (event: MouseEvent) => {
//                       onMouseMove(node, event)
//                   }
//                 : undefined,
//             onMouseLeave: onMouseLeave
//                 ? (event: MouseEvent) => {
//                       onMouseLeave(node, event)
//                   }
//                 : undefined,
//             onClick: onClick
//                 ? (event: MouseEvent) => {
//                       onClick(node, event)
//                   }
//                 : undefined,
//         }),
//         [node, onMouseEnter, onMouseMove, onMouseLeave, onClick]
//     )
