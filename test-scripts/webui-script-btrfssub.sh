set -x

DISK=$1

sgdisk --zap-all ${DISK}
sgdisk --new=0:0:+1MiB --typecode=0:ef02 ${DISK}
sgdisk --new=0:0:+1GB ${DISK}
mkfs.ext4 -F ${DISK}2
sgdisk --new=0:0:+10GiB ${DISK}
mkfs.btrfs -f ${DISK}3
#mkfs.btrfs -f -f -L btrfstest ${DISK}3
#sgdisk --new=0:0:+2GiB ${DISK}
#mkfs.btrfs -f -f -L btrfstest ${DISK}4

TMP_MOUNT="/tmp/btrfs-mount-test"
mkdir -p ${TMP_MOUNT}
mount ${DISK}3 ${TMP_MOUNT}
btrfs subvolume create ${TMP_MOUNT}/root
btrfs subvolume create ${TMP_MOUNT}/home
btrfs subvolume create ${TMP_MOUNT}/unused
btrfs subvolume snapshot ${TMP_MOUNT}/root ${TMP_MOUNT}/snapshot1
umount ${TMP_MOUNT}
rmdir ${TMP_MOUNT}


#sgdisk --new=0:0:0 ${DISK}
#mkfs.xfs -f ${DISK}4


udevadm trigger
udevadm settle --timeout=120

lsblk
blkid

