/*
 * Copyright (C) 2021 Red Hat, Inc.
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
import cockpit from "cockpit";

import React, { useEffect, useState } from "react";

import {
    AlertGroup, AlertVariant, AlertActionCloseButton, Alert,
    Page, Wizard
} from "@patternfly/react-core";

import { AddressContext } from "./Common.jsx";
import { InstallationDestination, applyDefaultStorage } from "./storage/InstallationDestination.jsx";
import { InstallationLanguage } from "./installation/InstallationLanguage.jsx";
import { InstallationProgress } from "./installation/InstallationProgress.jsx";
import { ReviewConfiguration } from "./installation/ReviewConfiguration.jsx";

import { readConf } from "../helpers/conf.js";
import { BossClient } from "../apis/boss.js";
import { LocalizationClient } from "../apis/localization.js";
import { StorageClient } from "../apis/storage.js";

import { usePageLocation } from "hooks";

const _ = cockpit.gettext;

export const Application = () => {
    const { path } = usePageLocation();
    const [address, setAddress] = useState();
    const [conf, setConf] = useState();
    const [isStorageReady, setIsStorageReady] = useState(false);
    const [notifications, setNotifications] = useState({});
    const [stepIdReached, setStepIdReached] = useState(path[0] || "installation-language");

    useEffect(() => cockpit.file("/run/anaconda/bus.address").watch(address => {
        const clients = [
            new LocalizationClient(address),
            new StorageClient(address),
            new BossClient(address)
        ];
        clients.forEach(c => c.init());

        setAddress(address);
    }), []);
    useEffect(() => readConf().then(setConf, ex => console.error("Failed to parse anaconda configuration")), []);

    const onAddNotification = (notificationProps) => {
        setNotifications({
            ...notifications,
            [notifications.length]: { index: notifications.length, ...notificationProps }
        });
    };

    const onAddErrorNotification = ex => {
        onAddNotification({ title: ex.name, message: ex.message, variant: "danger" });
    };

    // Postpone rendering anything until we read the dbus address and the default configuration
    if (!address || !conf) {
        return null;
    }

    console.info("conf: ", conf);
    const wrapWithContext = children => {
        return (
            <AddressContext.Provider value={address}>
                {children}
            </AddressContext.Provider>
        );
    };

    const steps = [
        {
            id: "installation-language",
            name: _("Installation language"),
            component: wrapWithContext(<InstallationLanguage />),
            stepNavItemProps: { id: "installation-language" },
            canJumpTo: stepIdReached === "installation-language"
        },
        {
            id: "installation-destination",
            name: _("Storage configuration"),
            component: wrapWithContext(<InstallationDestination onAddErrorNotification={onAddErrorNotification} />),
            stepNavItemProps: { id: "installation-destination" },
            canJumpTo: ["installation-destination", "review-configuration"].includes(stepIdReached),
        },
        {
            id: "review-configuration",
            name: _("Review"),
            component: wrapWithContext(<ReviewConfiguration />),
            enableNext: isStorageReady,
            nextButtonText: _("Begin installation"),
            stepNavItemProps: { id: "review-configuration" },
            canJumpTo: ["review-configuration"].includes(stepIdReached),
        },
        {
            id: "installation-progress",
            name: _("Installation progress"),
            component: wrapWithContext(<InstallationProgress onAddErrorNotification={onAddErrorNotification} />),
            stepNavItemProps: { id: "installation-progress" },
            isFinishedStep: true
        },
    ];
    const startAtStep = steps.findIndex(step => step.id === path[0]) + 1;
    const goToStep = (newStep, prevStep) => {
        if (prevStep.prevId === "installation-destination") {
            applyDefaultStorage({ address, onAddErrorNotification, onSuccess: () => setIsStorageReady(true) });
        }
        const stepIdx = steps.findIndex(s => s.id === stepIdReached);
        const newStepIdx = steps.findIndex(s => s.id === newStep.id);

        if (newStepIdx > stepIdx) {
            setStepIdReached(newStep.id);
        }
        cockpit.location.go([newStep.id]);
    };
    const title = _("Anaconda Installer");

    return (
        <Page data-debug={conf.Anaconda.debug}>
            {Object.keys(notifications).length > 0 &&
            <AlertGroup isToast isLiveRegion>
                {Object.keys(notifications).map(idx => {
                    const notification = notifications[idx];
                    const newNotifications = { ...notifications };
                    delete newNotifications[notification.index];

                    return (
                        <Alert
                          variant={AlertVariant[notification.variant]}
                          title={notification.title}
                          actionClose={
                              <AlertActionCloseButton
                                title={notifications.title}
                                onClose={() => setNotifications(newNotifications)}
                              />
                          }
                          key={notification.index}>
                            {notification.message}
                        </Alert>
                    );
                })}
            </AlertGroup>}
            <Wizard
              cancelButtonText={_("Quit")}
              description={_("PRE-RELEASE/TESTING")}
              descriptionId="wizard-top-level-description"
              hideClose
              mainAriaLabel={`${title} content`}
              navAriaLabel={`${title} steps`}
              onBack={goToStep}
              onGoToStep={goToStep}
              onNext={goToStep}
              startAtStep={startAtStep}
              steps={steps}
              title={_("Fedora Rawhide installation")}
              titleId="wizard-top-level-title"
            />
        </Page>
    );
};