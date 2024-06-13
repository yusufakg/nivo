import { BasicTooltip } from '@nivo/tooltip'
import { ComputedDatum } from './circle-packing/types'

export const CirclePackingTooltip = <RawDatum,>({
    id,
    formattedValue,
    color,
}: ComputedDatum<RawDatum>) => (
    <BasicTooltip id={id} value={formattedValue} enableChip={true} color={color} />
)
