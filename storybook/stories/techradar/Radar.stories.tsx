import type { Meta, StoryObj } from '@storybook/react'
import { generateWinesTastes } from '@nivo/generators'
import { patternDotsDef, patternSquaresDef } from '@nivo/core'
import { Radar, GridLabelProps } from '@nivo/techradar'

const meta: Meta<typeof Radar> = {
    title: 'Techradar',
    component: Radar,
    tags: ['autodocs'],
    args: {
        curve: 'linearClosed',
    },
}

export default meta
type Story = StoryObj<typeof Radar>

const commonProperties = {
    width: 900,
    height: 500,
    margin: { top: 60, right: 80, bottom: 30, left: 80 },
    ...generateWinesTastes(),
    indexBy: 'taste',
    animate: true,
}

export const Basic: Story = { render: args => <Radar {...commonProperties} curve={args.curve} /> }
