using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;


namespace ComputerStoreApi.Models
{
    // 1. PHÂN QUYỀN & NGƯỜI DÙNG SYSTEM
    public class Role
    {
        [Key]
        public string RoleName { get; set; } // admin, sales, accountant, warehouse, customer
        public string Description { get; set; }
        public virtual ICollection<User> Users { get; set; }
    }
}