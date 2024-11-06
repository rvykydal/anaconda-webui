set -x

DISK=$1

sgdisk --zap-all ${DISK}
sgdisk --new=0:0:+1MiB -t 0:ef02 ${DISK}
sgdisk --new=0:0:+4GiB ${DISK}
mkfs.ext4 ${DISK}2
sgdisk --new=0:0:+5GiB ${DISK}
mkfs.btrfs -f -f -L A ${DISK}3
#mkfs.xfs -f ${DISK}3
sgdisk --new=0:0:0 ${DISK}
mkfs.btrfs -f -f -L B ${DISK}4
#mkfs.ext4 ${DISK}4

lsblk
blkid

#sfdisk --part-uuid ${DISK} 3 66f47a35-b00e-4341-8f31-f4855fac24a2
#sfdisk --part-uuid ${DISK} 4 66f47a35-b00e-4341-8f31-f4855fac24a2

blkid
