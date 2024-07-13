import { BasicTooltip } from '@nivo/tooltip'
import { ComputedDatum } from './types'

export const CirclePackingTooltip = <RawData,>({
    id,
    formattedValue,
    color,
}: ComputedDatum<RawData>) => (
    <BasicTooltip id={id} value={formattedValue} enableChip={true} color={color} />
)
