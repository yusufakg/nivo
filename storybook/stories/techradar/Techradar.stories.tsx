import { Techradar } from '@nivo/techradar'
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

const meta: Meta<typeof Techradar> = {
    title: 'Techradar',
    component: Techradar,
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Techradar>

const sectors = ['sector1', 'sector2', 'sector3', 'sector4']

const rings = ['ring1', 'ring2', 'ring3']

const blips = [
    { sector: 's0', ring: 'r0', id: 'blip1' },
    { sector: 's0', ring: 'r0', id: 'blip2' },
    { sector: 's0', ring: 'r0', id: 'blip3' },
    { sector: 's0', ring: 'r0', id: 'blip4' },
    { sector: 's1', ring: 'r1', id: 'blip5' },
    { sector: 's1', ring: 'r1', id: 'blip6' },
    { sector: 's1', ring: 'r1', id: 'blip7' },
    { sector: 's1', ring: 'r1', id: 'blip8' },
    { sector: 's2', ring: 'r2', id: 'blip9' },
    { sector: 's2', ring: 'r2', id: 'blip10' },
    { sector: 's2', ring: 'r2', id: 'blip11' },
    { sector: 's2', ring: 'r2', id: 'blip12' },
    { sector: 's2', ring: 'r2', id: 'blip13' },
    { sector: 's2', ring: 'r2', id: 'blip14' },
    { sector: 's2', ring: 'r2', id: 'blip15' },
    { sector: 's2', ring: 'r2', id: 'blip16' },
    { sector: 's2', ring: 'r2', id: 'blip17' },
    { sector: 's2', ring: 'r2', id: 'blip18' },
    { sector: 's2', ring: 'r2', id: 'blip19' },
    { sector: 's2', ring: 'r2', id: 'blip20' },
]

const commonProperties = {
    width: 700,
    height: 700,
    margin: { top: 60, right: 80, bottom: 30, left: 80 },
    sectorData: sectors,
    ringData: rings,
    blipData: blips,
    animate: true,
}

export const Basic: Story = { render: args => <Techradar {...commonProperties} /> }
