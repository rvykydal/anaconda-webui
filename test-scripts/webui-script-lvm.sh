set -x

DISK=$1

sgdisk --zap-all ${DISK}
sgdisk --new=0:0:+1MiB --typecode=0:ef02 ${DISK}
sgdisk --new=0:0:+1GB ${DISK}
mkfs.ext4 -F ${DISK}2
sgdisk --new=0:0:+10GiB ${DISK}

VGNAME=vgrv

vgcreate -y -f ${VGNAME} ${DISK}3
lvcreate -y -l40%FREE -n root ${VGNAME}
mkfs.ext4 -F /dev/${VGNAME}/root
lvcreate -y -l90%FREE -n home ${VGNAME}
mkfs.ext4 -F /dev/${VGNAME}/home
lvcreate -y -l100%FREE -n swap ${VGNAME}
mkswap /dev/${VGNAME}/swap

#mkfs.btrfs -f -f -L btrfstest ${DISK}3
#sgdisk --new=0:0:+2GiB ${DISK}
#mkfs.btrfs -f -f -L btrfstest ${DISK}4


#sgdisk --new=0:0:0 ${DISK}
#mkfs.xfs -f ${DISK}4


udevadm trigger
udevadm settle --timeout=120

lsblk
blkid

