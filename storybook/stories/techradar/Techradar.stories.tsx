import type { Meta, StoryObj } from '@storybook/react'
import { Radar } from '@nivo/techradar'

const meta: Meta<typeof Radar> = {
    title: 'Techradar',
    component: Radar,
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Radar>

const sectors = ['s0', 's1', 's2', 's3']

const generateSectors = () => {
    const data = sectors.map(sector => {
        const d: Record<string, unknown> = { sector }

        return d
    })

    return { data, keys: [] }
}

const commonProperties = {
    width: 500,
    height: 500,
    margin: { top: 60, right: 80, bottom: 30, left: 80 },
    ...generateSectors(),
    indexBy: 'sector',
    animate: true,
}

export const Basic: Story = { render: args => <Radar {...commonProperties} /> }
