import { useMemo } from 'react'
import { Arc } from 'd3-shape'
import { RadarDataProps, } from './types'

interface RadarSliceProps<D extends Record<string, unknown>> {
    datum: D
    keys: RadarDataProps<D>['keys']
    index: string | number
    formatValue: (value: number, context: string) => string
    colorByKey: Record<string, string>
    startAngle: number
    endAngle: number
    radius: number
    arcGenerator: Arc<void, { startAngle: number; endAngle: number }>
}

export const RadarSlice = <D extends Record<string, unknown>>({
    radius,
    startAngle,
    endAngle,
    arcGenerator,
}: RadarSliceProps<D>) => {
    const { path } = useMemo(() => {
        return {
            path: arcGenerator({ startAngle, endAngle }) as string,
        }
    }, [startAngle, endAngle, radius, arcGenerator])

    return <path d={path} fill="#F00" fillOpacity={0} />
}
