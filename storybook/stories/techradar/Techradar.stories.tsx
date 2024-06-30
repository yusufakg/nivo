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

const sectors = ['sector1', 'sector2', 'sector3', 'sector4', 'sector4', 'sector4', 'sector4']

const rings = ['ring1', 'ring2', 'ring3', 'ring3', 'ring3']

const blips = [
    { sector: 's0', ring: 'r0', id: 'blip1' },
    // { sector: 's0', ring: 'r0', id: 'blip2' },
    // { sector: 's0', ring: 'r0', id: 'blip3' },
    // { sector: 's0', ring: 'r0', id: 'blip4' },
    // { sector: 's0', ring: 'r0', id: 'blip5' },
    // { sector: 's0', ring: 'r0', id: 'blip6' },
    // { sector: 's0', ring: 'r0', id: 'blip7' },
    // { sector: 's0', ring: 'r0', id: 'blip8' },
    { sector: 's3', ring: 'r2', id: 'blip9' },
    { sector: 's3', ring: 'r2', id: 'blip10' },
    { sector: 's3', ring: 'r2', id: 'blip11' },
    { sector: 's3', ring: 'r2', id: 'blip12' },
    { sector: 's3', ring: 'r2', id: 'blip13' },
    { sector: 's3', ring: 'r2', id: 'blip14' },
    { sector: 's3', ring: 'r2', id: 'blip15' },
    { sector: 's3', ring: 'r2', id: 'blip16' },
    { sector: 's3', ring: 'r2', id: 'blip17' },
    { sector: 's3', ring: 'r2', id: 'blip18' },
    { sector: 's3', ring: 'r2', id: 'blip19' },
    { sector: 's3', ring: 'r2', id: 'blip20' },
]

const commonProperties = {
    width: 500,
    height: 500,
    margin: { top: 60, right: 80, bottom: 30, left: 80 },
    sectorData: sectors,
    ringData: rings,
    blipData: blips,
    animate: true,
}

export const Basic: Story = { render: args => <Radar {...commonProperties} /> }
