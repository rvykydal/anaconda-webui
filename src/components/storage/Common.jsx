/*
 * Copyright (C) 2024 Red Hat, Inc.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with This program; If not, see <http://www.gnu.org/licenses/>.
 */
import { useEffect, useState } from "react";

import {
    getDevices,
    getDiskFreeSpace,
    getDiskTotalSpace,
    getMountPointConstraints,
    getRequiredDeviceSize,
} from "../../apis/storage_devicetree.js";
import {
    getRequiredSpace
} from "../../apis/payloads.js";
import { findDuplicatesInArray } from "../../helpers/utils.js";

export const useDiskTotalSpace = ({ selectedDisks, devices }) => {
    const [diskTotalSpace, setDiskTotalSpace] = useState();

    useEffect(() => {
        const update = async () => {
            const diskTotalSpace = await getDiskTotalSpace({ diskNames: selectedDisks });

            setDiskTotalSpace(diskTotalSpace);
        };
        update();
    }, [selectedDisks, devices]);

    return diskTotalSpace;
};

export const useDiskFreeSpace = ({ selectedDisks, devices }) => {
    const [diskFreeSpace, setDiskFreeSpace] = useState();

    useEffect(() => {
        const update = async () => {
            const diskFreeSpace = await getDiskFreeSpace({ diskNames: selectedDisks });

            setDiskFreeSpace(diskFreeSpace);
        };
        update();
    }, [selectedDisks, devices]);

    return diskFreeSpace;
};

export const useDuplicateDeviceNames = () => {
    const [duplicateDeviceNames, setDuplicateDeviceNames] = useState([]);

    useEffect(() => {
        const update = async () => {
            const devices = await getDevices();
            const _duplicateDeviceNames = findDuplicatesInArray(devices);

            setDuplicateDeviceNames(_duplicateDeviceNames);
        };
        update();
    }, []);

    return duplicateDeviceNames;
};

export const useHasFilesystems = ({ selectedDisks, devices }) => {
    const [hasFilesystems, setHasFilesystems] = useState();

    useEffect(() => {
        const _hasFilesystems = (
            selectedDisks.some(device => (
                devices[device]?.children.v.some(child => (
                    devices[child]?.formatData.mountable.v || devices[child]?.formatData.type.v === "luks")
                )
            ))
        );

        setHasFilesystems(_hasFilesystems);
    }, [selectedDisks, devices]);

    return hasFilesystems;
};

export const useRequiredSize = () => {
    const [requiredSize, setRequiredSize] = useState();

    useEffect(() => {
        const update = async () => {
            const requiredSpace = await getRequiredSpace().catch(console.error);
            const requiredSize = await getRequiredDeviceSize({ requiredSpace }).catch(console.error);

            setRequiredSize(requiredSize);
        };
        update();
    }, []);

    return requiredSize;
};

export const useMountPointConstraints = () => {
    const [mountPointConstraints, setMountPointConstraints] = useState([]);

    useEffect(() => {
        const update = async () => {
            const mountPointConstraints = await getMountPointConstraints().catch(console.error);
            setMountPointConstraints(mountPointConstraints);
        };
        update();
    }, []);

    return mountPointConstraints;
};
