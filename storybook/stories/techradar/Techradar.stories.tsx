import { Radar } from '@nivo/techradar'
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

const meta: Meta<typeof Radar> = {
    title: 'Techradar',
    component: Radar,
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Radar>

const sectors = ['sector1', 'sector2', 'sector3', 'sector4']

const rings = ['ring1', 'ring2', 'ring3']

const commonProperties = {
    width: 500,
    height: 500,
    margin: { top: 60, right: 80, bottom: 30, left: 80 },
    sectorData: sectors,
    ringData: rings,
    animate: true,
}

export const Basic: Story = { render: args => <Radar {...commonProperties} /> }
