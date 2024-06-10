import { degreesToRadians } from '@nivo/core'
import { scaleLinear } from 'd3-scale'
import { useMemo } from 'react'
import { RadarCommonProps, RadarDataProps } from './types'

export const useRadar = ({
    sectorData,
    ringData,
    rotationDegrees,
    width,
    height,
}: {
    sectorData: RadarDataProps['sectorData']
    ringData: RadarDataProps['ringData']
    rotationDegrees: RadarCommonProps['rotation']
    width: number
    height: number
    colors: RadarCommonProps['colors']
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
