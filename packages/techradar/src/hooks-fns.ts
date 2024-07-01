import { cloneDeep } from 'lodash'
import { ComputedDatum } from './types'

export const polarToCartesian = (
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

export const calculateEnergy = (nodes: ComputedDatum<any>[]) => {
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

export const getValidPosition = (
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

export const simulatedAnnealing = (
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
