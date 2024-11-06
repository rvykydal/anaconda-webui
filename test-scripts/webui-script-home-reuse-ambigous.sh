set -x

DISK=$1

# Fake previous installation (--type btrfs autopart)
sgdisk --zap-all ${DISK}
sgdisk --new=0:0:+1MiB -t 0:ef02 ${DISK}
sgdisk --new=0:0:+1GiB ${DISK}
sgdisk --new=0:0:+7GiB ${DISK}
mkfs.ext4 -F ${DISK}2
mkfs.btrfs -f ${DISK}3

TMP_MOUNT="/tmp/btrfs-mount-test"
mkdir -p ${TMP_MOUNT}
mount ${DISK}3 ${TMP_MOUNT}
btrfs subvolume create ${TMP_MOUNT}/root
btrfs subvolume create ${TMP_MOUNT}/home
btrfs subvolume create ${TMP_MOUNT}/data
btrfs subvolume snapshot ${TMP_MOUNT}/root ${TMP_MOUNT}/snapshot1
umount ${TMP_MOUNT}
rmdir ${TMP_MOUNT}


mkdir /existing_root
mount -o subvol=root,compress=zstd:1 ${DISK}3 /existing_root

# Mark existing root by a file
touch /existing_root/old_root_file

## Fake previous installation fstab
mkdir /existing_root/etc
cat > /existing_root/etc/fstab <<EOF
/dev/vda3 /                       btrfs   subvol=root,compress=zstd:1 0 0
/dev/vda2 /boot                   ext4    defaults        1 2
/dev/vda3 /home                   btrfs   subvol=home,compress=zstd:1 0 0
EOF

umount ${DISK}3

# Mark existing home by a file
mkdir /existing_home
mount -o subvol=home,compress=zstd:1 ${DISK}3 /existing_home
touch /existing_home/old_home_file
umount ${DISK}3

# Mark existing data by a file
mkdir /existing_data
mount -o subvol=data ${DISK}3 /existing_data
touch /existing_data/old_data_file
umount ${DISK}3

#================ add another root/os - ambigous
# It is also possible to do the above just on another disk

sgdisk --new=0:0:+2GiB ${DISK}
mkfs.btrfs -f ${DISK}4

TMP_MOUNT="/tmp/btrfs-mount-test"
mkdir -p ${TMP_MOUNT}
mount ${DISK}4 ${TMP_MOUNT}
btrfs subvolume create ${TMP_MOUNT}/root
btrfs subvolume create ${TMP_MOUNT}/home
umount ${TMP_MOUNT}
rmdir ${TMP_MOUNT}


mkdir /existing_root
mount -o subvol=root,compress=zstd:1 ${DISK}4 /existing_root

# Mark existing root by a file
touch /existing_root/old_root2_file

## Fake previous installation fstab
mkdir /existing_root/etc
cat > /existing_root/etc/fstab <<EOF
/dev/vda4 /                       btrfs   subvol=root,compress=zstd:1 0 0
/dev/vda2 /boot                   ext4    defaults        1 2
/dev/vda4 /home                   btrfs   subvol=home,compress=zstd:1 0 0
EOF

umount ${DISK}4


